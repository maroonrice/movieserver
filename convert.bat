@echo off
set /P FILEPATH=movie file: 
set /P STARTSEC=start second: 
set DIRPATH=%FILEPATH:.mp4=%
echo %DIRPATH%
mkdir %DIRPATH%
cd %DIRPATH%
ffmpeg -i %FILEPATH% -ss %STARTSEC% -c:v copy -c:a copy -f hls -hls_time 9 -hls_playlist_type vod -hls_segment_filename "video%%4d.ts" video.m3u8
ffmpeg -ss %STARTSEC% -i %FILEPATH% -frames:v 1 thumb.png
pause
