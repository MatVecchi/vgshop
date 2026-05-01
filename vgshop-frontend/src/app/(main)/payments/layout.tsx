export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl flex-1 mx-auto p-4">
      <div className="flex-1">
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
