Option Explicit
Dim shell, files, here, code
Set shell = CreateObject("WScript.Shell")
Set files = CreateObject("Scripting.FileSystemObject")
here = files.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = here
code = shell.Run("""C:\Program Files\nodejs\node.exe"" """ & here & "\agent.mjs""", 0, True)
WScript.Quit code
