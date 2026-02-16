export function Card({ className = "", children }) {
    return (
      <div className={`rounded-xl bg-white shadow-card ${className}`}>
        {children}
      </div>
    );
  }