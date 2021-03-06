
const fs = require(`fs`);
const pkgInfo = require('../../app/package.json');
const issConfig = require('./issConfig.json');

issConfig.AppName = pkgInfo.name;
issConfig.AppVersion = pkgInfo.version;

var createIssFile = function (appFileName, appIssPath)
{
  var self = this;

  var OutputDir = `..\\`;
  var SourceDir = `.\\${appFileName}`;
  var setupIco = `.\\app\\icons\\icon.ico`;
  var setupImg = `.\\app\\icons\\icon.bmp`;

  var iisStr = `
[Setup]
AppId=${issConfig.AppId}
AppName=${issConfig.AppName}
AppVersion=${issConfig.AppVersion}
AppPublisher=${issConfig.AppPublisher}, Inc.
AppSupportPhone=${issConfig.AppSupportPhone}
AppPublisherURL=${issConfig.AppPublisherURL}
AppSupportURL=${issConfig.AppSupportURL}
AppUpdatesURL=${issConfig.AppUpdatesURL}
DefaultDirName={pf}\\${issConfig.AppPublisher}\\${issConfig.AppName}
DefaultGroupName=${issConfig.AppPublisher}
OutputBaseFilename=${appFileName}-v${issConfig.AppVersion}
AppMutex=${issConfig.AppName}Production
SetupMutex=${issConfig.AppName}Setup
CloseApplications=force
OutputDir=${OutputDir}
SourceDir=${SourceDir}
Compression=lzma2
SolidCompression=yes
AppVerName=${issConfig.AppName}
UninstallDisplayIcon={app}\\${issConfig.AppName}.exe
${fs.existsSync(setupIco) ? `SetupIconFile=..\\..\\` + setupIco : ``}
${fs.existsSync(setupImg) ? `WizardSmallImageFile=..\\..\\` + setupImg : ``}
DisableProgramGroupPage=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Tasks]
Name: desktopicon; Description: {cm:CreateDesktopIcon}; GroupDescription: "Additional icons:"
Name: startmenuicon; Description: {cm:CreateStartmenuIcon}; GroupDescription: "Additional icons:"
Name: startupicon; Description: {cm:CreateStartupIcon}; GroupDescription: "Additional icons:"
Name: runapp; Description: "no"; GroupDescription: "no"; Check: WizardSilent

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{commondesktop}\\${issConfig.AppName}"; Filename: "{app}\\${issConfig.AppName}.exe"; Tasks: desktopicon
Name: "{commonstartmenu}\\${issConfig.AppName}"; Filename: "{app}\\${issConfig.AppName}.exe"; Tasks: startmenuicon
Name: "{userstartup}\\${issConfig.AppName}"; Filename: "{app}\\${issConfig.AppName}.exe"; Tasks: startupicon

[Run]
Filename: "{app}\\${issConfig.AppName}.exe"; Description: "Launch ${issConfig.AppName}"; Tasks: runapp; Flags: nowait postinstall; Check: WizardSilent
Filename: "{app}\\${issConfig.AppName}.exe"; Description: "Launch ${issConfig.AppName}"; Flags: nowait postinstall; Check: WizardNotSilent


[Code]
function InitializeSetup():boolean;
var
  MykeynotExist:boolean;
  ResultCode: Integer;
  uicmd: String;
  uicmd2: String;
begin
  MykeynotExist:= true;
  if RegQueryStringValue(HKEY_LOCAL_MACHINE, 'SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{23098B2F-1642-452A-A928-41885D3B4CBA}_is1', 'UninstallString', uicmd) then
  begin
  MyKeynotExist:= false;
  Exec(RemoveQuotes(uicmd), '', '', SW_SHOW, ewWaitUntilTerminated, ResultCode);
  end;
  Result:= MykeynotExist
end;


function WizardNotSilent(): Boolean;
begin
  Result := not WizardSilent();
end;
  `;

  fs.appendFileSync(appIssPath, iisStr, {flag: `w`});
}



module.exports = createIssFile;
