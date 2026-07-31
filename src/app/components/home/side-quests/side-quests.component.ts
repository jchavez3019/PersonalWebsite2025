/**
 * Side Quests home-tab catalog: preview icon, title, description, and creation date.
 */

import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

/**
 * Catalog entry for a Side Quest mini-app.
 *
 * To add a quest: build under side-quests/<slug>/, register a route, add an asset,
 * then append one object here with id, title, description, previewImage, createdAt, and router_link.
 */
export interface SideQuest {
  /** Stable slug-like id used for tracking and tie-breaking sort order. */
  id: string;
  /** Display title for the catalog row. */
  title: string;
  /** Short blurb shown under the title. */
  description: string;
  /** Path to the preview icon under src/assets. */
  previewImage: string;
  /** ISO calendar date (YYYY-MM-DD) when the quest was first published. */
  createdAt: string;
  /** In-app route to the mini-app (canonical catalog field; matches Projects). */
  router_link: string;
}

/**
 * Renders the Side Quests tab catalog and links into routed mini-apps.
 */
@Component({
  selector: 'app-side-quests',
  imports: [CommonModule, DatePipe, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './side-quests.component.html',
  styleUrl: './side-quests.component.css',
})
export class SideQuestsComponent {
  /**
   * In-repo catalog of Side Quests.
   * Append new quests here after registering their route and preview asset.
   */
  readonly sideQuests: SideQuest[] = [
    {
      id: 'mandarin-bingo',
      title: 'Mandarin Character Bingo',
      description:
        'Generate a printable 5×5 bingo board of traditional Mandarin characters with optional pinyin on the tiles.',
      previewImage: 'assets/side_quests/bingo_board_icon.png',
      createdAt: '2026-07-26',
      router_link: '/side-quests/mandarin-bingo',
    },
  ];

  /**
   * Returns catalog rows ordered by newest creation date first.
   *
   * @returns Sorted copy of {@link sideQuests}; equal dates break ties by id.
   */
  get sortedQuests(): SideQuest[] {
    return [...this.sideQuests].sort((a, b) => {
      if (a.createdAt === b.createdAt) {
        return a.id.localeCompare(b.id);
      }

      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }
}
