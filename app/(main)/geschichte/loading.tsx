import PageLoadingSkeleton from "@/components/PageLoadingSkeleton";
import { getTranslations } from "next-intl/server";
export default async function Loading() {
  const t = await getTranslations("loading");
  return <PageLoadingSkeleton label={t("geschichte")} />;
}
