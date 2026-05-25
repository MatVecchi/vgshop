import DotFieldBg from "@/components/DotFieldBg/DotFieldBg";
import GrainientBg from "@/components/GrainientBg/GrainientBg";

export default function PublisherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GrainientBg>
      <div className="max-w-7xl flex-1 mx-auto p-4 pt-28">
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h2 className="uppercase text-4xl font-bold">
              Publisher Dashboard
            </h2>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </GrainientBg>
  );
}
