export default function SuppliersPage() {
  const manualSearch = 'https://www.google.com/maps/search/' + encodeURIComponent('מחסן עצים')

  return (
    <div className="page">
      <h1 className="page-title">ספקים בסביבה שלי</h1>

      <div className="notice">
        <strong>מפת הספקים טרם פותחה</strong>
        החיפוש האוטומטי לפי מיקום ועיר ייבנה בשלב ד, על בסיס נתוני OpenStreetMap. עד אז אפשר לחפש ידנית.
      </div>

      <div className="card">
        <p>חיפוש ידני של מחסני עצים בגוגל מפות:</p>
        <a className="btn" href={manualSearch} target="_blank" rel="noopener noreferrer">
          פתח חיפוש ב-Google Maps
        </a>
      </div>
    </div>
  )
}
