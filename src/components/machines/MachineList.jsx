import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MachineCard from './MachineCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const MachineList = React.memo(({ machines, onMachineClick }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <AnimatePresence>
        {machines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onClick={() => onMachineClick(machine.id)}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
});

export default MachineList;