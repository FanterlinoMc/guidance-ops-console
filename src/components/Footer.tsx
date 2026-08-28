interface FooterProps {
  leadCount: number
}

export function Footer({ leadCount }: FooterProps) {
  return (
    <footer
      style={{
        borderTop: '1px solid #e5e3de',
        padding: '18px 34px 30px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'baseline',
        justifyContent: 'space-between',
      }}
    >
      <p
        style={{
          margin: 0,
          font: "400 11.5px/1.6 'IBM Plex Sans',sans-serif",
          color: '#8a97a3',
          maxWidth: '70ch',
        }}
      >
        Demonstration interface for Guidance Home Services. All {leadCount} lead records, emails and
        transcripts are fabricated sample data held in a single module in this app. No backend, no live
        figures, no customer information.
      </p>
      <span style={{ font: "400 11px/1.3 'IBM Plex Mono',monospace", color: '#a8b1ba' }}>
        v0.1 · mockup
      </span>
    </footer>
  )
}
