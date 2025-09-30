import React from 'react';

export interface StoryblokConfig {
  token: string;
  version?: 'draft' | 'published';
  region?: 'eu' | 'us' | 'ap' | 'ca';
  debug?: boolean;
}

export interface StoryblokStory {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  is_startpage: boolean;
  parent_id: number | null;
  meta_data: Record<string, any>;
  group_id: string;
  first_published_at: string | null;
  release_id: number | null;
  lang: string;
  path: string;
  alternates: any[];
  default_full_slug: string | null;
  translated_slugs: any[];
}

export interface StoryblokEvent {
  action: string;
  event_type: 'draft' | 'published';
  story_id: number;
  story: StoryblokStory;
}

export type StoryblokEventType = 
  | 'input' 
  | 'change' 
  | 'published' 
  | 'unpublished' 
  | 'viewLiveVersion'
  | 'enterEditmode' 
  | 'enterComponent' 
  | 'hoverComponent' 
  | 'highlightComponent'
  | 'customEvent' 
  | 'pingBack' 
  | 'sessionReceived' 
  | 'editedBlok' 
  | 'deselectBlok'
  | 'addedBlock' 
  | 'deletedBlock' 
  | 'movedBlock' 
  | 'duplicatedBlock';

export interface StoryblokContextType {
  draftContent: StoryblokStory | null;
  publishedContent: StoryblokStory | null;
  isInEditor: boolean;
  isLoading: boolean;
  error: string | null;
  eventCount: number;
  refreshContent: () => Promise<void>;
  sdk?: any;
  renderContent?: (content?: any) => React.ReactNode;
}

// Component prop types
export interface StoryblokComponentProps {
  blok: any;
  _editable?: string;
  [key: string]: any;
}

// Blok interface for type safety
export interface StoryblokBlok {
  _uid: string;
  component: string;
  _editable?: string;
  [key: string]: any;
}