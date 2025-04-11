// Feature disabled page

export default function TemplatesDisabledPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Custom Templates Feature Disabled</h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow">
        <p className="text-yellow-700 mb-2">The custom PIP templates feature has been disabled.</p>
        <p className="text-yellow-700">Please use the standard system templates available when creating a new PIP.</p>
      </div>
    </div>
  );
}