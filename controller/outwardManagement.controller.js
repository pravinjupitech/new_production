import { OutWord } from "../model/outwardManagement.model.js";

export const saveOutword = async (req, res, next) => {
    try {
        const saveOutw = await OutWord.create(req.body);
        return saveOutw ? res.status(200).json({ message: "Data Saved", status: true }) : res.status(400).json({ message: "Not Found", status: false })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}

export const getOutWord = async (req, res, next) => {
    try {
        const { database } = req.params;
        const Data = await OutWord.find({ database })
        return Data.length > 0 ? res.status(200).json({ message: "Data Found", Data, status: true }) : res.status(400).json({ message: "Not Found", status: false })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error", status: false })
    }
}