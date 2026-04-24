import {
  Button,
  ButtonVariant,
  ButtonSize,
  Dropdown,
  Tabs,
  Tab,
  TabVariant,
  Badge,
  BadgeSize,
  IconName,
} from '@eightfold.ai/octuple';
import { Icon } from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';
import './PositionHeader.css';

const TOP_LEVEL_VERSIONS = [
  { id: 'floating-input-v3', label: 'Floating panel v3' },
  { id: 'od-actionable', label: 'OD Actionable' },
  { id: 'oda-2-0', label: 'ODA 2.0' },
  { id: 'oda-3', label: 'ODA 3' },
  { id: 'free-world', label: 'Free world' },
] as const;

const ARCHIVED_VERSIONS = [
  { id: 'floating-chat', label: 'Floating chat' },
  { id: 'floating-input-v2', label: 'Floating input panel v2' },
  { id: 'inline-nudges', label: 'Inline nudges' },
  { id: 'inline-chat', label: 'Inline chat' },
  { id: 'actionable', label: 'Actionable' },
] as const;

const ALL_VERSIONS = [...TOP_LEVEL_VERSIONS, ...ARCHIVED_VERSIONS];

interface PositionHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  nudgeVersion: string;
  onNudgeVersionChange: (id: string) => void;
}

export default function PositionHeader({
  activeTab,
  onTabChange,
  nudgeVersion,
  onNudgeVersionChange,
}: PositionHeaderProps) {
  const _activeLabel =
    ALL_VERSIONS.find((o) => o.id === nudgeVersion)?.label ?? 'Version';
  void _activeLabel;

  const isArchivedActive = ARCHIVED_VERSIONS.some((o) => o.id === nudgeVersion);

  const versionMenu = (
    <ul className="version-dropdown-menu" role="listbox">
      {TOP_LEVEL_VERSIONS.map((opt) => (
        <li key={opt.id} role="option" aria-selected={nudgeVersion === opt.id}>
          <button
            type="button"
            className={`version-dropdown-item${nudgeVersion === opt.id ? ' active' : ''}`}
            onClick={() => onNudgeVersionChange(opt.id)}
          >
            {opt.label}
          </button>
        </li>
      ))}
      <li className="version-dropdown-divider" role="separator" />
      <li className={`version-dropdown-nested${isArchivedActive ? ' has-active' : ''}`}>
        <button type="button" className="version-dropdown-item version-dropdown-nested-trigger">
          Archived
          <Icon path={mdiChevronRight} size={0.7} color="#69717F" />
        </button>
        <ul className="version-dropdown-submenu" role="listbox">
          {ARCHIVED_VERSIONS.map((opt) => (
            <li key={opt.id} role="option" aria-selected={nudgeVersion === opt.id}>
              <button
                type="button"
                className={`version-dropdown-item${nudgeVersion === opt.id ? ' active' : ''}`}
                onClick={() => onNudgeVersionChange(opt.id)}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );

  return (
    <div className="position-header">
      <div className="position-top">
        <div className="position-title-row">
          <div className="position-title-group">
            <h1 className="position-title">Software Engineer</h1>
          </div>
          <div className="position-header-actions">
            <Dropdown
              overlay={versionMenu}
              placement="bottom-end"
              closeOnDropdownClick
              offset={4}
              dropdownClassNames="version-dropdown-container"
            >
              <Button
                text="Version"
                variant={ButtonVariant.Default}
                size={ButtonSize.Medium}
                iconProps={{ path: IconName.mdiChevronDown }}
                ariaLabel="Switch prototype version"
              />
            </Dropdown>
            <Button
              text="Manage position"
              variant={ButtonVariant.Primary}
              iconProps={{ path: IconName.mdiCogOutline }}
            />
          </div>
        </div>
        <div className="position-meta">
          <span className="meta-id">25213661</span>
          <span className="meta-dot">•</span>
          <span>San Francisco, CA</span>
          <span className="meta-status">
            <span className="status-dot status-open" />
            Open
          </span>
          <span className="meta-status">
            <span className="status-dot status-published" />
            Published
          </span>
        </div>
      </div>

      <div className="position-tabs">
        <Tabs
          value={activeTab}
          onChange={(value) => onTabChange(String(value))}
          variant={TabVariant.default}
        >
          <Tab
            value="applicants"
            label="Applicants"
            badgeContent={<Badge size={BadgeSize.Small}>10</Badge>}
          />
          <Tab
            value="ai-interview"
            label="AI Interview"
            badgeContent={<Badge size={BadgeSize.Small}>22</Badge>}
          />
          <Tab
            value="shortlist"
            label="Shortlist"
            badgeContent={<Badge size={BadgeSize.Small}>2</Badge>}
          />
        </Tabs>
      </div>
    </div>
  );
}
