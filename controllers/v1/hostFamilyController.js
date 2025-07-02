const HostFamily = require("../../models/hostFamilyUser.model.js");


const createHostHeavenData = async (req, res) => {
    try {
        const { userId, pairHeavenData } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const hostFamily = await HostFamily.findById(userId);

        if (!hostFamily) {
            return res.status(404).json({ message: 'Host family not found' });
        }

        hostFamily.user.pairHeavenEnabled = true;
        hostFamily.user.pairHeavenData = pairHeavenData;

        await hostFamily.save();

        return res.status(200).json({
            message: 'Pair Heaven data updated successfully',
            data: hostFamily
        });
    } catch (error) {
        console.error('Error in createHostHeavenData:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const createHostConnectData = async (req, res) => {
    try {
        const { userId, pairConnectData } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const hostFamily = await HostFamily.findById(userId);

        if (!hostFamily) {
            return res.status(404).json({ message: 'Host family not found' });
        }

        hostFamily.user.pairConnectEnabled = true;
        hostFamily.user.pairConnectData = pairConnectData;

        await hostFamily.save();

        return res.status(200).json({
            message: 'Pair Connect data updated successfully',
            data: hostFamily
        });
    } catch (error) {
        console.error('Error in createHostConnectData:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createHostConnectData, createHostHeavenData }
