const mocklist: {[k in string]: {[j in string]: (req: any, res: any, parsed?: any) => Promise<void>}} = {}
const addMock = (path: string, method: string, func: (req: any, res: any, parsed?: any) => Promise<void>) => {
  if (mocklist[path] === undefined) {
    mocklist[path] = {}
  }
  mocklist[path][method] = func
}
const strcut = (obj: string | {[k in string]: {}}, num: number): string | {[k in string]: {}} => {
  if (typeof obj == 'string') {
    if (obj.length > num) {
      return obj.slice(0, num) + '...'
    }
  } else if (typeof obj == 'object') {
    var result: {[k in string]: string | {[k in string]: {}}} = {}
    for (var key in obj) {
      result[key] = strcut(obj[key], num)
    }
    return result
  }
  return obj
}
const getMock = (path: string, method: string) => {
  const hitpath: string[] = Object.keys(mocklist)
    .filter((mockpath) => path.match('^' + mockpath + '$'))
    .filter((mockpath) => mocklist[mockpath][method])
  return hitpath.length > 0 ? mocklist[hitpath[0]][method] : undefined
}
const sleep = (m: number) => {
  return new Promise((resolve) => setTimeout(resolve, m))
}

/* Mock記述エリア */
addMock('/api/version', 'GET', async (req: any, res: any) => {
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.write(JSON.stringify({result: 'v1'}))
})

addMock('/api/files', 'GET', async (req: any, res: any) => {
  await sleep(300)
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.write(JSON.stringify([
    {name: 'Vite', image: '/assets/favicon.svg'},
    {name: 'Vue', image: '/assets/favicon.svg'},
    {name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'},
    {name: '動画１', image: '/assets/favicon.svg'},
    {name: '動画２'}
  ]))
})
addMock('/api/login', 'GET', async (req: any, res: any) => {
  await sleep(300)
  res.writeHead(302, {'location': '/page/list/index.html'})
  res.write("")
})
addMock('/api/session', 'GET', async (req: any, res: any) => {
  await sleep(300)
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.write(JSON.stringify({'name': 'dummy name'}))
})
addMock('/api/disk', 'GET', async (req: any, res: any) => {
  await sleep(300)
  res.writeHead(200, {'Content-Type': 'application/json'})
  res.write(JSON.stringify({'total':239098617856, 'used':159811612672, 'free':79287005184}))
})

/* Mock記述エリア */

export default {
  isApi(req: any): boolean {
    const reqPath = req.url.split('?', 2)[0]
    return getMock(reqPath, req.method) != undefined
  },
  response: function (req: any, res: any) {
    let body = ''
    req.on('data', (chunk: any) => {
      body += chunk
    })
    req.on('end', async () => {
      const split = req.url.split('?', 2)
      const reqPath: string = split[0]
      console.log('Mock API: ' + req.method + ' ' + reqPath)
      var parsed: {[k in string]: string} = {}
      if (split[1] && (req.method == 'GET' || req.method == 'DELETE')) {
        for (var param of split[1]?.split('&')) {
          const kv: string[] = param.split('=',2)
          if (kv.length == 2) {
            parsed[kv[0]] = decodeURIComponent(kv[1])
          }
        }
      } else {
        try {
          parsed = JSON.parse(body)
        } catch(e) {}
      }
      console.log(JSON.stringify(strcut(parsed, 50), null, 2))
      const mock = getMock(reqPath, req.method)
      if (mock !== undefined) {
        await mock(req, res, parsed)
      }
      res.end()
    })
  }
}
