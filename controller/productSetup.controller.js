import { ProductSetup } from "../model/productsetup.model.js";

export const AddproductType = async (req, res, next) => {
    try {
        const addtype = await ProductSetup.create(req.body)
        return addtype ? res.status(200).json({ message: "Data Saved", status: true }) : res.status(404).json({ message: "Bad Request", status: false })
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error", status: false });
    }
}

export const viewproductType = async (req, res, next) => {
    try {
        const { database } = req.params;
        const productType = await ProductSetup.find({ database, status: "Active" })
        return productType.length > 0 ? res.status(200).json({ message: "Data Found", productType, status: true }) : res.status(404).json({ message: "Not Found", status: false })
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error", status: false });
    }

}

export const deleteProductSetup = async (req, res, next) => {
    try {
        const { id } = req.params
        const productSetup = await ProductSetup.findByIdAndDelete(id)
        return productSetup ? res.status(200).json({ message: "Data Deleted", status: true }) : res.status(404).json({ message: "Not Found", status: false })
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ error: "Internal Server Error", status: false });
    }
}