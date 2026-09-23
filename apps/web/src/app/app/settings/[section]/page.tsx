import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SETTINGS_SECTIONS, type SettingsSection } from "@dialbrio/types";
import { SettingsSectionView } from "@/features/settings/sections";
import { SETTINGS_SECTIONS_CONFIG } from "@/features/settings/section-config";

const isSection = (s: string): s is SettingsSection => (SETTINGS_SECTIONS as readonly string[]).includes(s);

export function generateStaticParams() {
  return SETTINGS_SECTIONS.map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const label = SETTINGS_SECTIONS_CONFIG.find((s) => s.id === section)?.label;
  return { title: label ? `${label} settings` : "Settings" };
}

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isSection(section)) notFound();
  return <SettingsSectionView section={section} />;
}
