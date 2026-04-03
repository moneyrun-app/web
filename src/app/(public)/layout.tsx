export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center px-4 md:px-10 h-14 md:h-16 border-b border-border">
        <span className="text-lg md:text-xl font-bold text-foreground">머니런</span>
      </header>
      {children}
    </div>
  );
}
