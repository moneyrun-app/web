interface Props {
  message: string;
}

export default function TodayMessage({ message }: Props) {
  return (
    <div className="bg-grade-yellow-bg rounded-2xl p-5">
      <p className="text-sm font-semibold mb-2 text-foreground">오늘의 한마디</p>
      <p className="text-base leading-relaxed">{message}</p>
    </div>
  );
}
