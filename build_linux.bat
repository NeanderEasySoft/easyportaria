@echo off
SET DELPHI_BIN="C:\Program Files (x86)\Embarcadero\Studio\22.0\bin"
SET PROJECT=EasyBlueBackEnd.dpr

echo Compilando %PROJECT% para Linux...
%DELPHI_BIN%\dcclinux64.exe ^
    -B ^
    -Q ^
    -NSSystem;Xml;Data;Datasnap;Web;Soap;Vcl;Winapi;System.Win;Data.Win;Datasnap.Win;Web.Win;Soap.Win;Xml.Win;Bde;Horse;Horse.Core;Horse.Commons ^
    %PROJECT%

if %ERRORLEVEL% EQU 0 (
    echo Compilacao concluida com sucesso!
    echo Executavel gerado em: .\Linux64\Release\%PROJECT:.dpr=%.so
) else (
    echo Erro na compilacao!
)

pause 