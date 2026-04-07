/**
 * Google Apps Script for creating the Drive folders used by
 * "The Wall of Porta Romana" in this portfolio.
 *
 * How to use:
 * 1. Open https://script.google.com/
 * 2. Create a new project
 * 3. Paste this file into the editor
 * 4. Run createPortaRomanaDriveFolders()
 * 5. Approve Drive permissions when prompted
 * 6. Copy the logged IDs into lib/project-images.ts
 */

const ROOT_FOLDER_ID = '19ZBWezlQrISQ-SK-hSGwfwChrpiKYYfV';
const PROJECT_SLUG = 'the-wall-of-porta-romana';
const PROJECT_FOLDER_NAME = 'The Wall of Porta Romana';

const REQUIRED_SUBFOLDERS = [
  { key: 'cover', name: 'cover' },
  { key: 'gallery', name: 'gallery' },
  { key: 'process', name: 'process' },
  { key: 'wide', name: 'wide' },
];

const OPTIONAL_REFERENCE_FOLDERS = [
  'chapter 01 - urban context',
  'chapter 02 - architecture',
  'chapter 03 - structure',
  'chapter 04 - technology',
  'chapter 05 - materiality',
];

function createPortaRomanaDriveFolders() {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const projectFolder = getOrCreateFolder_(root, PROJECT_FOLDER_NAME);

  projectFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const created = {
    folder: projectFolder.getId(),
  };

  REQUIRED_SUBFOLDERS.forEach(({ key, name }) => {
    const subfolder = getOrCreateFolder_(projectFolder, name);
    subfolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    created[key] = subfolder.getId();
  });

  const referencesFolder = getOrCreateFolder_(projectFolder, 'chapter references');
  referencesFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  OPTIONAL_REFERENCE_FOLDERS.forEach((name) => {
    const folder = getOrCreateFolder_(referencesFolder, name);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  });

  Logger.log('Created / reused Drive folders for "%s"', PROJECT_FOLDER_NAME);
  Logger.log('Project folder URL: %s', projectFolder.getUrl());
  Logger.log('Paste this into lib/project-images.ts:');
  Logger.log(buildDriveFoldersSnippet_(created));
}

function getOrCreateFolder_(parentFolder, folderName) {
  const existing = parentFolder.getFoldersByName(folderName);
  if (existing.hasNext()) {
    return existing.next();
  }

  return parentFolder.createFolder(folderName);
}

function buildDriveFoldersSnippet_(ids) {
  return [
    `  '${PROJECT_SLUG}': {`,
    `    folder:             '${ids.folder}',`,
    `    cover:              '${ids.cover}',`,
    `    gallery:            '${ids.gallery}',`,
    `    process:            '${ids.process}',`,
    `    wide:               '${ids.wide}',`,
    `  },`,
  ].join('\n');
}
