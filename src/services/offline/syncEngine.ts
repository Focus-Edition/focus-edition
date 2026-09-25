import { Edition, Mission } from '../../types/mission';
import { loadOfflineEditions, saveOfflineEditions, enqueueOfflineAction } from './storage';
import { INITIAL_SEEDS } from '../../constants/seeds';

class SyncEngine {
  private editions: Edition[] = [];
  private initialized: boolean = false;

  public async initialize(): Promise<Edition[]> {
    if (this.initialized) return this.editions;

    const saved = await loadOfflineEditions();
    if (saved && saved.length > 0) {
      this.editions = saved;
    } else {
      this.editions = JSON.parse(JSON.stringify(INITIAL_SEEDS));
      await saveOfflineEditions(this.editions);
    }

    this.initialized = true;
    return this.editions;
  }

  public getEditions(): Edition[] {
    return this.editions;
  }

  public getEditionById(id: string): Edition | undefined {
    return this.editions.find(e => e.id === id);
  }

  public getMissionById(missionId: string): { edition: Edition; mission: Mission } | undefined {
    for (const edition of this.editions) {
      const mission = edition.missions.find(m => m.id === missionId);
      if (mission) {
        return { edition, mission };
      }
    }
    return undefined;
  }

  public async toggleMissionDone(editionId: string, missionId: string): Promise<Mission | undefined> {
    const edition = this.getEditionById(editionId);
    if (!edition) return undefined;

    const mission = edition.missions.find(m => m.id === missionId);
    if (!mission) return undefined;

    mission.done = !mission.done;
    edition.progress = edition.missions.filter(m => m.done).length;
    edition.status =
      edition.progress === 0
        ? 'draft'
        : edition.progress === edition.totalMissions
        ? 'completed'
        : 'in_progress';
    edition.updatedAt = new Date().toISOString().slice(0, 10);

    await saveOfflineEditions(this.editions);
    await enqueueOfflineAction('toggle_mission', { editionId, missionId, done: mission.done });
    return mission;
  }

  public async markAllMissions(editionId: string, markDone: boolean): Promise<Edition | undefined> {
    const edition = this.getEditionById(editionId);
    if (!edition) return undefined;

    edition.missions.forEach(m => (m.done = markDone));
    edition.progress = markDone ? edition.totalMissions : 0;
    edition.status = markDone ? 'completed' : 'draft';
    edition.updatedAt = new Date().toISOString().slice(0, 10);

    await saveOfflineEditions(this.editions);
    return edition;
  }

  public async addEdition(edition: Edition): Promise<void> {
    this.editions.unshift(edition);
    await saveOfflineEditions(this.editions);
    await enqueueOfflineAction('create_edition', { editionId: edition.id, title: edition.title });
  }

  public async deleteEdition(id: string): Promise<boolean> {
    const beforeCount = this.editions.length;
    this.editions = this.editions.filter(e => e.id !== id);
    if (this.editions.length !== beforeCount) {
      await saveOfflineEditions(this.editions);
      await enqueueOfflineAction('delete_edition', { editionId: id });
      return true;
    }
    return false;
  }

  public async duplicateEdition(id: string): Promise<Edition | undefined> {
    const source = this.getEditionById(id);
    if (!source) return undefined;

    const copyId = `ed_${Date.now()}_copy`;
    const copy: Edition = {
      ...JSON.parse(JSON.stringify(source)),
      id: copyId,
      title: `${source.title} (Copy)`,
      status: 'draft',
      progress: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      missions: source.missions.map((m: Mission, idx: number) => ({
        ...m,
        id: `${copyId}_m${idx + 1}`,
        editionId: copyId,
        done: false
      }))
    };

    this.editions.unshift(copy);
    await saveOfflineEditions(this.editions);
    return copy;
  }

  public filterEditions(
    searchQuery: string = '',
    statusFilter: string = 'all'
  ): Edition[] {
    const q = searchQuery.toLowerCase().trim();
    return this.editions.filter(ed => {
      const matchesSearch =
        !q ||
        ed.title.toLowerCase().includes(q) ||
        ed.description.toLowerCase().includes(q) ||
        ed.tags.some(t => t.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || ed.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }
}

export const syncEngine = new SyncEngine();
