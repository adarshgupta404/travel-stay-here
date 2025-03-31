import { getPropertyBySlug } from "@/app/actions/property";
import { IProperty } from "@/app/models/Property";
import PropertyPageDetails from "@/components/property/PropertyPage";

export default async function PropertyPage({
  params,
}: {
  params: { slug: string };
}) {
  const property: { success: boolean; data: IProperty } =
    await getPropertyBySlug(params.slug);

  if (!property) {
    return <div>Property not found</div>;
  }

  return <PropertyPageDetails property={property.data} />;
}
