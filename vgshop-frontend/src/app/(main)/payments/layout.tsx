import GrainientBg from "@/components/GrainientBg/GrainientBg";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GrainientBg>
      <div className="max-w-7xl flex-1 mx-auto p-4 pt-16">
        <div className="flex-1">
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </GrainientBg>
  );
}
