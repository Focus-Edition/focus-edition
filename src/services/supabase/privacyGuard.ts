import { UserProfile } from '../../types/user';

export class AiPrivacyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiPrivacyViolationError';
  }
}

/**
 * Strict Privacy Guard:
 * Focus Edition enforces privacy by default. Private document content
 * is NEVER transmitted to external AI endpoints unless the user has explicitly
 * opted in via their profile settings.
 */
export function checkAiPrivacyPermission(user: UserProfile | null | undefined): void {
  if (!user) {
    throw new AiPrivacyViolationError(
      'Document privacy guard blocked external transmission: User is not authenticated.'
    );
  }

  if (user.allowAiProcessing !== true) {
    throw new AiPrivacyViolationError(
      'Document privacy guard blocked external transmission: "Allow AI processing" is disabled in user preferences. All extraction and mission generation must run on-device / privately.'
    );
  }
}

export function isAiProcessingAllowed(user: UserProfile | null | undefined): boolean {
  return !!user && user.allowAiProcessing === true;
}
