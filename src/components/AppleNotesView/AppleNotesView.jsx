import './AppleNotesView.css'

function AppleNotesView() {
  return (
    <div className="apple-notes-view">
      <webview
        src="https://www.icloud.com/notes"
        className="apple-notes-webview"
        allowpopups="true"
      />
    </div>
  )
}

export default AppleNotesView
