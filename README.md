# movie server with oidc

## python起動

```
python -m pip install -r requirements.txt
python app.py
```

## クライアントサイドの開発

### 初期設定
```
cd page
npm install
```

### 開発
```
npm run dev
```

### ビルド
```
npm run build
```

## 動画作成

```
ffmpeg -i 動画ファイル -c:v copy -c:a copy -f hls -hls_time 9 -hls_playlist_type vod -hls_segment_filename "video%4d.ts" video.m3u8
```

```
ffmpeg -ss 1 -i 動画ファイル -frames:v 1 thumb.png
```

```
ffmpeg -i video.m3u8 -c:v libx264 -preset medium -crf 32 -c:a aac -b:a 128k -hls_list_size 0 low\video.m3u8
```