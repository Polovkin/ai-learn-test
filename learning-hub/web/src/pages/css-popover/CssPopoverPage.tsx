import './css-popover.css'

export default function CssPopoverPage() {
  return (
    <section className="popover-demo">
      <header className="popover-header">
        <strong>CSS Learn</strong>
        <nav className="popover-desktop-nav" aria-label="Demo navigation">
          <a href="#css-home">Home</a><a href="#css-lessons">Lessons</a><a href="#css-practice">Practice</a><a href="#css-notes">Notes</a>
        </nav>
        <button className="popover-button" popoverTarget="mobile-css-nav" aria-label="Open menu" type="button">
          <span /><span /><span />
        </button>
      </header>
      <nav popover="auto" id="mobile-css-nav" className="popover-mobile-nav" aria-label="Mobile demo navigation">
        <a href="#css-home">Home</a><a href="#css-lessons">Lessons</a><a href="#css-practice">Practice</a><a href="#css-notes">Notes</a>
      </nav>
      <div className="popover-copy">
        <h1>Native popover burger menu</h1>
        <p>This adaptive menu uses HTML and CSS only. Resize the browser to see the mobile burger button.</p>
      </div>
    </section>
  )
}
