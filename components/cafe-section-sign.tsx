export default function CafeSectionSign({ chinese, english, className = '' }: {
  chinese: string;
  english: string;
  className?: string;
}) {
  return (
    <span className={`cafe-section-sign ${className}`.trim()}>
      <span className="cafe-section-sign-rounds" lang="zh-Hant" role="img" aria-label={chinese}>
        {Array.from(chinese).map((character, index) => (
          <span className="cafe-section-sign-round" aria-hidden="true" key={`${character}-${index}`}>{character}</span>
        ))}
      </span>
      <span className="cafe-section-sign-ribbon">{english}</span>
    </span>
  );
}
