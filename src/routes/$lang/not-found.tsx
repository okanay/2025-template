import { createFileRoute } from "@tanstack/react-router";

export const CustomNotFoundPage = () => {
  return (
    <main className="bg-neutral-100 min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-7xl p-6 rounded-lg items-center flex flex-col text-center">
        <h1 className="text-7xl font-extrabold text-sky-500 mb-4">404</h1>
        <p className="text-3xl font-semibold text-neutral-700">
          Sayfa bulunamadı.
        </p>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/$lang/not-found")({
  component: CustomNotFoundPage,
});
