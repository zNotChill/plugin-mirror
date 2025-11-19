

export type PluginInfo = {
  id: string;
  slug: string;
  project_types: string[];
  games: string[];
  team_id: string;
  organization: string | null;
  name: string;
  summary: string;
  description: string;
  published: string;
  updated: string;
  approved: string;
  queued: string | null;
  status: string;
  requested_status: string | null;
  moderator_message: string | null;
  license: PluginLicense | null;
  downloads: number;
  followers: number;
  categories: string[];
  additional_categories: string[];
  loaders: string[];
  versions: string[];
  icon_url: string | null;
  link_urls: {
    [key: string]: PluginLink;
  };
  gallery: PluginGalleryItem[];
  color: string | null;
  thread_id: string | null;
  monetization_status: string;
  side_types_migration_review_status: string | null;
  game_versions: string[];
}

export type PluginLink = {
  platform: string;
  donation: boolean;
  url: string;
}

export type PluginGalleryItem = {
  url: string;
  raw_url: string;
  featured: boolean;
  name: string;
  description: string | null;
  created: string;
  ordering: number;
}

export type PluginLicense = {
  id: string;
  name: string;
  url: string | null;
}

export type PluginVersion = {
  id: string;
  project_id: string;
  author_id: string;
  name: string;
  version_number: string;
  project_types: string[];
  games: string[];
  changelog: string | null;
  date_published: string;
  version_type: string;
  status: string;
  requested_status: string | null;
  files: PluginFile[];
  dependencies: PluginDependency[];
  loaders: string[];
  ordering: number | null;
  game_versions: string[];
  environment: string;
}

export type PluginFile = {
  hashes: {
    sha1: string;
    sha512: string;
  }
  url: string;
  filename: string;
  primary: boolean;
  size: number;
  file_type: string | null;
}

export type PluginDependency = {
  version_id: string | null;
  project_id: string;
  file_name: string | null;
  dependency_type: string;
}