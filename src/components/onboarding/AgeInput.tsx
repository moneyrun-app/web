'use client';

interface AgeInputProps {
  value: number;
  onChange: (v: number) => void;
}

export default function AgeInput({ value, onChange }: AgeInputProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">몇 살이야?</h2>
      <input
        type="number"
        inputMode="numeric"
        placeholder="나이를 입력해줘"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-4 py-4 rounded-xl bg-card text-lg outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
