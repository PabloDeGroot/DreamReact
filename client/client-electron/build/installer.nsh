!macro customInstall
  DetailPrint "URL Protocol"
  DeleteRegKey HKCR "dream"
  WriteRegStr HKCR "dream" "" "URL:dream"
  WriteRegStr HKCR "dream" "URL Protocol" ""
  WriteRegStr HKCR "dream\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  WriteRegStr HKCR "dream\shell" "" ""
  WriteRegStr HKCR "dream\shell\Open" "" ""
  WriteRegStr HKCR "dream\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1"
!macroend