"use client";

// Template management has been disabled
export default function TemplateManagementClient() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow">
      <p className="text-yellow-700 font-semibold">The custom PIP templates feature has been disabled.</p>
      <p className="text-yellow-700 mt-2">Please use the standard system templates available when creating a new PIP.</p>
    </div>
  );
}