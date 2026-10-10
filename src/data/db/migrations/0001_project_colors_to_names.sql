-- Projects stored their colour as a hex. `project/ochre` is defined per theme
-- (#84783D light, #A69A62 dark), so a stored hex is wrong in one of the two.
-- The column now holds the swatch name and the palette owns the values.

UPDATE projects SET color = 'terracotta' WHERE color = '#C86F52';
UPDATE projects SET color = 'dusk'       WHERE color = '#8175C7';
UPDATE projects SET color = 'sage'       WHERE color = '#A8C7B1';
UPDATE projects SET color = 'sunset'     WHERE color = '#E5A47F';

-- The fifth swatch used to be #6D625B, the pre-contrast-pass textSecondary
-- borrowed as a neutral. Ochre Olive is what replaced it.
UPDATE projects SET color = 'ochre'      WHERE color = '#6D625B';

-- Anything else still holding a hex would render as no colour at all, since
-- the lookup would miss. Fall back rather than leave a project unmarked.
UPDATE projects SET color = 'terracotta' WHERE color LIKE '#%';
