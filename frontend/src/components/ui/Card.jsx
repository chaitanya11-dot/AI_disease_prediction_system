export default function Card({ children, className = "", hover = false, as: Tag = "div", ...props }) {
  const hasBg = /\bbg-/.test(className);
  const hasBorder = /\bborder-none\b/.test(className);
  return (
    <Tag
      className={`${hasBg ? "" : "bg-white dark:bg-clinical-900"} ${
        hasBorder ? "" : "border border-clinical-100 dark:border-clinical-800"
      } rounded-2xl shadow-card ${
        hover ? "transition-shadow hover:shadow-card-hover" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
