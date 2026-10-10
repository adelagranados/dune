import journal from './meta/_journal.json';
import m0000 from './0000_wet_chimera.sql';
import m0001 from './0001_project_colors_to_names.sql';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
  },
};
