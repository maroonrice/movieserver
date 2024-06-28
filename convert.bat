@echo off
set /P FILEPATH=movie file: 
set /P STARTSEC=start second: 
call :MAIN_EXEC %FILEPATH% %STARTSEC%
goto :EOF

:MAIN_EXEC
set FILEPATH=%1
set DIRPATH="%~dpn1"
set STARTSEC=%2
mkdir %DIRPATH%
cd %DIRPATH%
ffmpeg -i %FILEPATH% -ss %STARTSEC% -c:v copy -c:a copy -f hls -hls_time 9 -hls_playlist_type vod -hls_segment_filename "video%%4d.ts" video.m3u8
ffmpeg -ss %STARTSEC% -i %FILEPATH% -frames:v 1 thumb.png
pause
goto :EOF
