import { resetApplicationsStore } from './applications';
import { resetJobDescriptionStore } from './job-descriptions';
import { resetResumeStore } from './resumes';
import { resetCoverLetterStore } from './cover-letters';
import { resetInterviewStore } from './interviews';
import { resetSettingsStore } from './settings';

export function resetUserStores() {
  resetApplicationsStore();
  resetJobDescriptionStore();
  resetResumeStore();
  resetCoverLetterStore();
  resetInterviewStore();
  resetSettingsStore();
}
