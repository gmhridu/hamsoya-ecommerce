interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  return (
    <div>
      <h1>Product Detail</h1>
      <p>This is the product detail page {id}.</p>
    </div>
  );
}
