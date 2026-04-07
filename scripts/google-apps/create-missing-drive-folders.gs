/**
 * Google Apps Script for creating the Drive folders used by
 * "Aquapraca", "Mondadori", and "Biennale" in this portfolio.
 */

const ROOT_FOLDER_ID = '19ZBWezlQrISQ-SK-hSGwfwChrpiKYYfV'; // Same root as Porta Romana

const PROJECTS = [
  { slug: 'aquapraca', name: 'Aquapraca' },
  { slug: 'mondadori', name: 'Palazzo Mondadori' },
  { slug: 'biennale', name: 'Venice Biennale 2025' } // check project names.
];

const REQUIRED_SUBFOLDERS = [
  { key: 'cover', name: 'cover' },
  { key: 'gallery', name: 'gallery' },
  { key: 'process', name: 'process' },
  { key: 'wide', name: 'wide' },
];

function createMissingDriveFolders() {
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const results = {};

  PROJECTS.forEach(project => {
    const projectFolder = getOrCreateFolder_(root, project.name);
    projectFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const created = {
      folder: projectFolder.getId(),
    };

    REQUIRED_SUBFOLDERS.forEach(({ key, name }) => {
      const subfolder = getOrCreateFolder_(projectFolder, name);
      subfolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      created[key] = subfolder.getId();
    });

    results[project.slug] = created;
  });

  Logger.log('Created / reused Drive folders');
  Logger.log('Paste this into lib/project-images.ts:');
  
  const snippets = Object.keys(results).map(slug => {
    return buildDriveFoldersSnippet_(slug, results[slug]);
  });
  
  Logger.log(snippets.join('\n\n'));
  return snippets.join('\n\n');
}

function getOrCreateFolder_(parentFolder, folderName) {
  const existing = parentFolder.getFoldersByName(folderName);
  if (existing.hasNext()) {
    return existing.next();
  }
  return parentFolder.createFolder(folderName);
}

function buildDriveFoldersSnippet_(slug, ids) {
  return [
    `  '${slug}': {`,
    `    folder:             '${ids.folder}',`,
    `    cover:              '${ids.cover}',`,
    `    gallery:            '${ids.gallery}',`,
    `    process:            '${ids.process}',`,
    `    wide:               '${ids.wide}',`,
    `  },`
  ].join('\n');
}
