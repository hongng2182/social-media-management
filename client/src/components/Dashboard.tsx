import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224 }}>
      <Tabs value={value}
        onChange={handleChange}
        orientation="vertical"
        sx={{ borderRight: 1, borderColor: 'divider' }}>
        <Tab label="Accounts" />
        <Tab label="All Posts" />
      </Tabs>
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