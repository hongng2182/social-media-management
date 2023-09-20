import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Accounts from './Accounts';
import AllPosts from './AllPosts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}


function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      style={{ width: '100%' }}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}


function Dashboard() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}>
      <AppBar position="static" sx={{ borderRight: 1, borderColor: 'divider', maxWidth: 200 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ textAlign: 'center', p: 2}}
        >
          SOCIALSYNC
        </Typography>
        <Tabs value={value}
          onChange={handleChange}
          orientation="vertical"
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="inherit"
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200 }}>
          <Tab label="Accounts" />
          <Tab label="All Posts" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <Accounts />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AllPosts />
      </TabPanel>
    </Box>

  );
}

export default Dashboard; 