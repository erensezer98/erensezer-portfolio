-- Migration: Add Unfolding Landscapes and Tóor-Tóor School projects
-- Run this in the Supabase SQL Editor to insert these two projects into an existing database.
-- After running, upload images to Google Drive and replace each PLACEHOLDER_* with the real FILE_ID.

INSERT INTO projects (title, slug, category, short_description, description, year, location, tags, cover_image, images, featured, order_index) VALUES
(
  'Unfolding Landscapes',
  'unfolding-landscapes',
  'competition',
  'Protective roof encircling Roman ruins in Calabria, creating a dialogue between archaeological and environmental landscapes.',
  'The objective of the proposal for the reuse of the Thermae of Curinga is to understand the impact and interaction between the archaeological and environmental landscapes of Curinga and to devise a design solution that allows both landscapes to coexist harmoniously.

This interaction is symbolized by a singular roof element that encircles the entire perimeter of the ruins for protection. Additionally, this roof serves as a roof for a walkway beneath it, providing users with a panoramic view of the ruins, while a singular passage has been incorporated to allow a transversal journey through the ruins for a more direct internal experience. The priority has been given to establishing a seamless external and internal experience for users within this archaeological landscape, simultaneously fostering an appreciation for the environmental landscape of Curinga.

As for the design, the roof follows a language extracted from the movement of both the topography around the ruins and the ruins themselves. The movement of the topography solely depends on the levels and layers, while the movement of the ruins depends on the spaces that need to be focused on, framing certain views to be highlighted from the outside, such as the frigidarium. With this organic movement mimicking the environmental landscape, the roof creates a camouflage effect for the ruins, protecting and adapting them to the land, yet it also gives some hints and mystery for the ruins from the outside.

In addition to the dialogue between the landscapes, the structure draws inspiration from the architectural identity of the ruins. It is designed with a starting point from a central cross vault, historically noted as the roofing for the central room of the bath, the frigidarium. In terms of materiality, the entire roof is made of clay, paying homage to the Roman African construction techniques, specifically the use of clay in pottery.',
  2023,
  'Curinga, Calabria, Italy',
  ARRAY['archaeology', 'ruins', 'landscape', 'roof', 'competition', 'Roman', 'Calabria', 'clay', 'thermae'],
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_COVER',
  ARRAY[
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_GALLERY_2',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_UNFOLDING_GALLERY_3'
  ],
  true,
  6
),
(
  'Tóor-Tóor School',
  'toor-toor-school',
  'academic',
  'Community school in Senegal drawing from traditional Senegalese typologies, with rammed earth construction and flexible spaces around a central outdoor playground.',
  'Drawing inspiration from traditional Senegalese typologies, it is observed that the seemingly unsystematic arrangement of scattered houses is actually systematic in accordance with the needs of the users. Moreover, these houses feature public gathering spaces located at their center. By embracing this typology and integrating the concept of flexibility, the objective is to develop a school that can adapt to the versatile functions required by both the students and the wider community. These principles guide the planning approach, aiming to arrange the functions systematically in a circular plan, centred around an outdoor playground.

Before diving into the plan and functionality, priority is given to viewing the school through the lens of a child''s perspective. Recognizing that a child''s environment significantly influences their growth and development, efforts are made to create an enriching school environment. To achieve this, emphasis is placed on the dominant use of curved elements throughout the design, evoking a sense of playfulness. Additionally, the atmosphere is enhanced by incorporating vibrant colors and engaging patterns, fostering a playful and inviting ambiance for the children.

Starting from the plan, as the students are the primary users, the classrooms are positioned in a radial pattern around the central area. To facilitate flexibility, there are six classrooms separated by flexible spaces. The classrooms and the spaces in between, totaling ten modules, are designed as separate volumetric units, connecting them. Each module consists of an inclined roof, a door, two windows, and a flexible opening. These flexible spaces, including the Laboratory, Canteen, Offices, and Sickroom, serve as connectors between the classrooms. While these flexible spaces are initially designed to meet the school''s needs, consideration is also given to their potential for community use. These spaces are intended to serve the students first and then cater to the community after school hours, promising shelter and living space for underprivileged community members.',
  2023,
  'Senegal',
  ARRAY['school', 'education', 'Senegal', 'rammed earth', 'circular plan', 'flexible spaces', 'community', 'bamboo', 'timber'],
  'https://lh3.googleusercontent.com/d/PLACEHOLDER_TOOR_TOOR_COVER',
  ARRAY[
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_TOOR_TOOR_GALLERY_1',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_TOOR_TOOR_GALLERY_2',
    'https://lh3.googleusercontent.com/d/PLACEHOLDER_TOOR_TOOR_GALLERY_3'
  ],
  true,
  7
);
