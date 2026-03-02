import { VerticalNav, StatusMessage, Flex } from "@kui/react";
import { useCollections } from "../../api/useCollectionsApi";
import type { Collection } from "../../types/collections";
import { CollectionItem } from "./CollectionItem";
import { useCollectionsStore } from "../../store/useCollectionsStore";
import { FolderOpen } from "lucide-react";

interface CollectionsGridProps {
  searchQuery: string;
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Flex 
      justify="center" 
      align="center" 
      style={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: 'var(--background-color-surface-navigation)',
        borderRight: '1px solid var(--border-color-base)'
      }}
    >
      {children}
    </Flex>
  );
};

export const CollectionsGrid = ({ searchQuery }: CollectionsGridProps) => {
  const { data, isLoading, error } = useCollections();
  const { selectedCollections, toggleCollection } = useCollectionsStore();

  const filteredCollections = (data || [])
    .filter((collection: Collection) => {
      if (collection.collection_name === "metadata_schema" || collection.collection_name === "meta") {
        return false;
      }
      return collection.collection_name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a: Collection, b: Collection) => 
      a.collection_name.toLowerCase().localeCompare(b.collection_name.toLowerCase())
    );

  if (isLoading) {
    return (
      <Wrapper>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ee0000' }}>
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
          <span style={{ color: 'var(--text-color-default)', fontSize: '14px' }}>Loading collections...</span>
        </div>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <StatusMessage
          slotHeading="Failed to load collections"
          slotMedia={<FolderOpen size={32} style={{ color: 'var(--text-color-subtle)' }} />}
        />
      </Wrapper>
    );
  }

  if (!filteredCollections.length && searchQuery) {
    return (
      <Wrapper>
        <StatusMessage
          slotHeading="No matches found"
          slotSubheading={`No collections match "${searchQuery}"`}
          slotMedia={<FolderOpen size={32} style={{ color: 'var(--text-color-subtle)' }} />}
        />
      </Wrapper>
    );
  }

  if (!data?.length || !filteredCollections.length) {
    return (
      <Wrapper>
        <StatusMessage
          slotHeading="No collections"
          slotSubheading="Create your first collection and add files to customize your model response."
          slotMedia={<FolderOpen size={32} style={{ color: 'var(--text-color-subtle)' }} />}
        />
      </Wrapper>
    );
  }

  return (
    <VerticalNav
      style={{ width: '100%' }}
      items={filteredCollections.map((collection: Collection) => ({
        id: collection.collection_name,
        slotLabel: (
          <CollectionItem 
            collection={collection} 
          />
        ),
        active: selectedCollections.includes(collection.collection_name),
        href: `#${collection.collection_name}`,
        attributes: {
          VerticalNavLink: {
            onClick: (e: React.MouseEvent) => {
              e.preventDefault();
              toggleCollection(collection.collection_name);
            }
          }
        }
      }))}
    />
  );
};
