const { OtherSource } = require('../models');

const getAllOtherSources = async (req, res) => {
    try {
        const otherSources = await OtherSource.findAll();
        res.json(otherSources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createOtherSource = async (req, res) => {
    try {
        const {name, active} = req.body;
        const newOtherSource = await OtherSource.create({name, active});
        res.status(201).json(newOtherSource);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getOtherSourceById = async (req, res) => {
    try {
        const otherSource = await OtherSource.findByPk(req.params.id);
        if (otherSource) {
            res.json(otherSource);
        } else {
            res.status(404).json({ error: 'Other Source not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateOtherSource = async (req, res) => {
    try {
        const {name, active} = req.body;
        const [updated] = await OtherSource.update({
            name, active
        }, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedOtherSource = await OtherSource.findByPk(req.params.id);
            res.json(updatedOtherSource);
        } else {
            res.status(404).json({ error: 'Other Source not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getAllOtherSources,
    createOtherSource,
    getOtherSourceById,
    updateOtherSource
}
