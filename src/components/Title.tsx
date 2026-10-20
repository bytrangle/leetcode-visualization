interface TitleProps {
  text: string
}

export default function Title({ text }: TitleProps) {
  return (
    <h1 className="title" aria-label={text}>
      {text.split('').map((ch, i) =>
        ch === ' ' ? (
          <span key={i} className="letter-space" aria-hidden="true">
            {'\u00A0'}
          </span>
        ) : (
          <span key={i} className="letter" style={{ animationDelay: `${i * 80}ms` }}>
            {ch}
          </span>
        ),
      )}
    </h1>
  )
}