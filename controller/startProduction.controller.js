import { Product } from "../model/product.model.js";
import { RowProduct } from "../model/rowProduct.model.js";
import { StartProduction } from "../model/startProduction.model.js";
import { Warehouse } from "../model/warehouse.model.js";

export const createProduction = async (req, res, next) => {
  try {
    const { product_details } = req.body;
    for (const item of product_details) {
      if (item?.rProduct_name) {
        await updateProductQty(
          item?.rProduct_name,
          item?.rProduct_name_Units,
          "deduct",
          res
        );
      }
      if (item?.finalProductDetails) {
        for (let item1 of item?.finalProductDetails) {
          await updateProductQty(
            item1?.fProduct_name,
            item1?.fProduct_name_Units,
            "add",
            res
          );
        }
      }

      if (item?.wastageProductDetails) {
        for (let item1 of item?.wastageProductDetails) {
          await updateProductQty(
            item1?.wProduct_name,
            item1?.wProduct_name_Units,
            "add",
            res
          );
        }
      }
    }

    const product = await StartProduction.create(req.body);
    return product
      ? res.status(200).json({ message: "Data Added", status: true })
      : res
        .status(404)
        .json({ message: "Something Went Wrong", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

const updateProductQty = async (
  productId,
  productUnits,
  actionType,
  res
) => {
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
      status: false,
    });
  }

  for (const unit of productUnits) {
    if (unit.unit === product.stockUnit) {
      if (actionType === "deduct") {
        product.qty -= unit.qty;

        await productionlapseWarehouse(
          unit.qty,
          product.warehouse,
          productId
        );
      } else if (actionType === "add") {
        product.qty += unit.qty;

        await productionAddWarehouse(
          unit.qty,
          product.warehouse,
          productId
        );
      }
    }
  }

  await product.save();
};

export const viewProduct = async (req, res, next) => {
  try {
    const product = await StartProduction.find({
      database: req.params.database,
      financeYear: req.params.financeYear
    })
      .sort({ sortorder: -1 })
      .populate({ path: "product_details.user_name", model: "user" })
      .populate({
        path: "product_details.finalProductDetails.fProduct_name",
        model: "product",
      })
      .populate({ path: "product_details.rProduct_name", model: "product" })
      .populate({
        path: "product_details.wastageProductDetails.wProduct_name",
        model: "product",
      })
    // .populate({ path: "processName", model: "category" });

    // const products = await StartProduction.aggregate([
    //   {
    //     $group: {
    //       _id: "$processName",
    //       count: { $sum: 1 },
    //     },
    //   },
    //   {
    //     $match: {
    //       count: { $gt: 1 },
    //     },
    //   },
    // ]);
    // console.log(products);

    // const result = await StartProduction.aggregate([
    //   {
    //     $lookup: {
    //       from: "steps",
    //       localField: "processName",
    //       foreignField: "processName",
    //       as: "processDetails",
    //     },
    //   },
    //   {
    //     $unwind: "$processDetails",
    //   },
    //   {
    //     $group: {
    //       _id: "$processName",
    //       count: { $sum: 1 },
    //       details: { $push: "$processDetails" },
    //     },
    //   },
    //   {
    //     $match: {
    //       count: { $gt: 1 },
    //     },
    //   },
    // ]);
    // console.log("result", result);

    return product.length > 0
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const viewByIdProduct = async (req, res, next) => {
  try {
    const product = await StartProduction.findById(req.params.id).populate({
      path: "product_details.user_name",
      model: "user",
    });
    return product
      ? res.status(200).json({ message: "Data Found", product, status: true })
      : res.status(404).json({ message: "Not Found", status: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const FindProduct = await StartProduction.findById(id);
    if (!FindProduct) {
      return res.status(404).json({ message: "Not Found", status: false });
    }
    for (const item of FindProduct.product_details) {
      await handleProductRevert(item);
    }
    await StartProduction.findByIdAndDelete(id);
    res.status(200).json({ message: "Data Deleted", status: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

export const deleteNestedProduct = async (req, res, next) => {
  try {
    const { id, innerId } = req.params;
    const parentProduct = await StartProduction.findById(id);

    if (!parentProduct) {
      return res
        .status(404)
        .json({ message: "Parent data not found", status: false });
    }

    const findIndex = parentProduct.product_details.findIndex(
      (item) => item._id.toString() === innerId
    );

    if (findIndex !== -1) {
      await handleProductRevert(parentProduct.product_details[findIndex]);
      parentProduct.product_details.splice(findIndex, 1);
      await parentProduct.save();
      if (parentProduct.product_details.length === 0) {
        await StartProduction.findByIdAndDelete(id);
        return res.status(200).json({
          message: "Production Step With Parent Data Deleted",
          status: true,
        });
      }
      return res.status(200).json({
        message: "Production Step deleted successfully",
        status: true,
      });
    } else {
      return res.status(404).json({
        error: "Nested productionStep not found",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", status: false });
  }
};

const handleProductRevert = async (item) => {
  if (item?.rProduct_name && item?.rProduct_name_Units.length > 0) {
    const Rowproduct = await Product.findById(item.rProduct_name);
    await revertStockUnits(item?.rProduct_name_Units, Rowproduct, "add");
    console.log(revertStockUnits || 0);
  }
  if (item?.finalProductDetails && item?.finalProductDetails.length > 0) {
    for (let item1 of item?.finalProductDetails) {
      if (item1?.fProduct_name && item1?.fProduct_name_Units?.length > 0) {
        const Rowproduct = await Product.findById(item1?.fProduct_name);
        await revertStockUnits(
          item1?.fProduct_name_Units,
          Rowproduct,
          "deduct"
        );
      }
    }
  }
  if (item?.wastageProductDetails && item?.wastageProductDetails.length > 0) {
    for (let item1 of item?.wastageProductDetails) {
      if (item1?.wProduct_name && item1?.wProduct_name_Units.length > 0) {
        const Rowproduct = await Product.findById(item1.wProduct_name);
        await revertStockUnits(
          item1?.wProduct_name_Units,
          Rowproduct,
          "deduct"
        );
      }
    }
  }
};

const revertStockUnits = async (units, product, actionType) => {
  if (units.length > 0) {
    for (const unit of units) {
      if (unit.unit === product.stockUnit) {
        product.qty =
          actionType === "add"
            ? product.qty + unit.qty
            : product.qty - unit.qty;
        await product.save();
        await (actionType === "add"
          ? productionAddWarehouse(unit.qty, product.warehouse, product._id)
          : productionlapseWarehouse(
            unit.qty,
            product.warehouse,
            product._id
          ));
      }
    }
  } else {
    console.error("Expected 'units' to be an array, but got:", units);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const oldProduction = await StartProduction.findById(id);

    if (!oldProduction) {
      return res.status(404).json({
        message: "Production not found",
        status: false,
      });
    }

    // Restore old stock
    for (const item of oldProduction.product_details) {
      if (item.rProduct_name) {
        await updateProductQty(
          item.rProduct_name,
          item.rProduct_name_Units,
          "add",
          res
        );
      }

      for (const finalItem of item.finalProductDetails || []) {
        if (finalItem?.fProduct_name) {
          await updateProductQty(
            finalItem.fProduct_name,
            finalItem.fProduct_name_Units,
            "deduct",
            res
          );
        }
      }

      for (const wasteItem of item.wastageProductDetails || []) {
        if (wasteItem?.wProduct_name) {
          await updateProductQty(
            wasteItem.wProduct_name,
            wasteItem.wProduct_name_Units,
            "deduct",
            res
          );
        }
      }
    }

    // Apply new stock
    for (const item of req.body.product_details) {
      if (item.rProduct_name) {
        await updateProductQty(
          item.rProduct_name,
          item.rProduct_name_Units,
          "deduct",
          res
        );
      }

      for (const finalItem of item.finalProductDetails || []) {
        if (finalItem?.fProduct_name) {
          await updateProductQty(
            finalItem.fProduct_name,
            finalItem.fProduct_name_Units,
            "add",
            res
          );
        }
      }

      for (const wasteItem of item.wastageProductDetails || []) {
        if (wasteItem?.wProduct_name) {
          await updateProductQty(
            wasteItem.wProduct_name,
            wasteItem.wProduct_name_Units,
            "add",
            res
          );
        }
      }
    }

    const updated = await StartProduction.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      message: "Data Updated",
      status: true,
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      status: false,
    });
  }
};

// export const NestedUpdateProduct = async (req, res, next) => {
//   try {
//     const { id, innerId } = req.params;
//     const { product_details } = req.body;
//     const Productfind = await StartProduction.findById(id);
//     if (!Productfind) {
//       return res
//         .status(404)
//         .json({ message: "Product not found", status: false });
//     }
//     const findIndex = Productfind.product_details.findIndex(
//       (item) => item._id.toString() === innerId
//     );

//     if (findIndex === -1) {
//       return res
//         .status(404)
//         .json({ message: "Inner product not found", status: false });
//     }

//     const existingItem = Productfind.product_details[findIndex];
//     const calculateQtyDifference = (existingUnits, currentUnits, stockUnit) => {
//       const existingQty = existingUnits.reduce(
//         (total, unit) => (unit.unit === stockUnit ? total + unit.value : total),
//         0
//       );
//       const currentQty = currentUnits.reduce(
//         (total, unit) => (unit.unit === stockUnit ? total + unit.value : total),
//         0
//       );
//       return {
//         existingQty,
//         currentQty,
//         qtyDifference: currentQty - existingQty,
//       };
//     };
//     const updateStock = async (
//       item,
//       productType,
//       typeUnits,
//       actionType,
//       qty
//     ) => {
//       if (!item[productType]) return;

//       const Rowproduct = await RowProduct.findById(item[productType]);
//       if (!Rowproduct) return;

//       await Promise.all(
//         item[typeUnits].map(async (unit) => {
//           if (unit.unit === Rowproduct.stockUnit) {
//             Rowproduct.qty += actionType === "Add" ? qty : -qty;

//             const warehouseFunc =
//               actionType === "Add"
//                 ? productionAddWarehouse
//                 : productionlapseWarehouse;

//             await warehouseFunc(
//               Math.abs(qty),
//               Rowproduct.warehouse,
//               item[productType]
//             );
//             await Rowproduct.save();
//           }
//         })
//       );
//     };
//     const processUpdates = async () => {
//       if (
//         product_details.rProduct_name &&
//         existingItem.rProduct_name &&
//         product_details.rProduct_name_Units.length > 0
//       ) {
//         const Rowproduct = await RowProduct.findById(
//           product_details.rProduct_name
//         );
//         if (Rowproduct) {
//           const { existingQty, currentQty, qtyDifference } =
//             calculateQtyDifference(
//               existingItem.rProduct_name_Units,
//               product_details.rProduct_name_Units,
//               Rowproduct.stockUnit
//             );

//           if (qtyDifference > 0) {
//             await updateStock(
//               product_details,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Add",
//               qtyDifference
//             );
//           } else if (qtyDifference < 0) {
//             await updateStock(
//               product_details,
//               "rProduct_name",
//               "rProduct_name_Units",
//               "Lapse",
//               Math.abs(qtyDifference)
//             );
//           }
//         }
//       }

//       if (product_details.finalProductDetails?.length > 0) {
//         await Promise.all(
//           product_details.finalProductDetails.map(async (product) => {
//             const existingFinal = await existingItem.finalProductDetails?.find(
//               (p) => p.fProduct_name === product.fProduct_name
//             );

//             if (existingFinal) {
//               const Rowproduct = await RowProduct.findById(
//                 product.fProduct_name
//               );
//               if (Rowproduct) {
//                 const { existingQty, currentQty, qtyDifference } =
//                   calculateQtyDifference(
//                     existingFinal.fProduct_name_Units,
//                     product.fProduct_name_Units,
//                     Rowproduct.stockUnit
//                   );

//                 if (qtyDifference > 0) {
//                   await updateStock(
//                     product,
//                     "fProduct_name",
//                     "fProduct_name_Units",
//                     "Add",
//                     qtyDifference
//                   );
//                 } else if (qtyDifference < 0) {
//                   await updateStock(
//                     product,
//                     "fProduct_name",
//                     "fProduct_name_Units",
//                     "Lapse",
//                     Math.abs(qtyDifference)
//                   );
//                 }
//               }
//             } else {
//               console.log("not found final product");
//               const Rowproduct = await RowProduct.findById(
//                 product.fProduct_name
//               );
//               if (Rowproduct) {
//                 const totalQty = product.fProduct_name_Units.reduce(
//                   (sum, unit) =>
//                     unit.unit === Rowproduct.stockUnit ? sum + unit.value : sum,
//                   0
//                 );
//                 console.log("final TotalQty", totalQty);
//                 await updateStock(
//                   product,
//                   "fProduct_name",
//                   "fProduct_name_Units",
//                   "Add",
//                   totalQty
//                 );
//               }
//             }
//           })
//         );
//       }

//       if (product_details.wastageProductDetails?.length > 0) {
//         await Promise.all(
//           product_details.wastageProductDetails.map(async (product) => {
//             const existingWaste =
//               await existingItem.wastageProductDetails?.find(
//                 (p) => p.wProduct_name === product.wProduct_name
//               );

//             if (existingWaste) {
//               const Rowproduct = await RowProduct.findById(
//                 product.wProduct_name
//               );
//               if (Rowproduct) {
//                 const { existingQty, currentQty, qtyDifference } =
//                   calculateQtyDifference(
//                     existingWaste.wProduct_name_Units,
//                     product.wProduct_name_Units,
//                     Rowproduct.stockUnit
//                   );

//                 if (qtyDifference > 0) {
//                   await updateStock(
//                     product,
//                     "wProduct_name",
//                     "wProduct_name_Units",
//                     "Add",
//                     qtyDifference
//                   );
//                 } else if (qtyDifference < 0) {
//                   await updateStock(
//                     product,
//                     "wProduct_name",
//                     "wProduct_name_Units",
//                     "Lapse",
//                     Math.abs(qtyDifference)
//                   );
//                 }
//               }
//             } else {
//               console.log("not found wastage product");
//               const Rowproduct = await RowProduct.findById(
//                 product.wProduct_name
//               );
//               if (Rowproduct) {
//                 const totalQty = product.wProduct_name_Units.reduce(
//                   (sum, unit) =>
//                     unit.unit === Rowproduct.stockUnit ? sum + unit.value : sum,
//                   0
//                 );
//                 console.log("wastage Product qty", totalQty);
//                 await updateStock(
//                   product,
//                   "wProduct_name",
//                   "wProduct_name_Units",
//                   "Add",
//                   totalQty
//                 );
//               }
//             }
//           })
//         );
//       }
//     };

//     await processUpdates();

//     Productfind.product_details[findIndex] = product_details;
//     await Productfind.save();

//     res
//       .status(200)
//       .json({ message: "Data Updated Successfully", status: true });
//   } catch (error) {
//     console.error("Error updating product details:", error);
//     res.status(500).json({ message: "Internal Server Error", status: false });
//   }
// };

export const NestedUpdateProduct = async (req, res, next) => {
  try {
    const { id, innerId } = req.params;
    const { product_details, processName, step_name } = req.body;
    const Productfind = await StartProduction.findById(id);
    if (!Productfind) {
      return res
        .status(404)
        .json({ message: "Product not found", status: false });
    }

    const findIndex = Productfind.product_details.findIndex(
      (item) => item._id.toString() === innerId
    );

    if (findIndex === -1) {
      return res
        .status(404)
        .json({ message: "Inner product not found", status: false });
    }

    const existingItem = Productfind.product_details[findIndex];
    const calculateQtyDifference = (existingUnits, currentUnits, stockUnit) => {
      const existingQty = existingUnits.reduce(
        (total, unit) => (unit.unit === stockUnit ? total + unit.value : total),
        0
      );
      const currentQty = currentUnits.reduce(
        (total, unit) => (unit.unit === stockUnit ? total + unit.value : total),
        0
      );
      return {
        existingQty,
        currentQty,
        qtyDifference: currentQty - existingQty,
      };
    };

    const updateStock = async (
      item,
      productType,
      typeUnits,
      actionType,
      qty
    ) => {
      if (!item[productType]) return;

      const Rowproduct = await RowProduct.findById(item[productType]);
      if (!Rowproduct) return;

      for (const unit of item[typeUnits]) {
        if (unit.unit === Rowproduct.stockUnit) {
          Rowproduct.qty += actionType === "Add" ? qty : -qty;

          const warehouseFunc =
            actionType === "Add"
              ? productionAddWarehouse
              : productionlapseWarehouse;

          await warehouseFunc(
            Math.abs(qty),
            Rowproduct.warehouse,
            item[productType]
          );
          await Rowproduct.save();
        }
      }
    };
    const processUpdates = async () => {
      if (
        product_details.rProduct_name &&
        existingItem.rProduct_name &&
        product_details.rProduct_name_Units.length > 0
      ) {
        const Rowproduct = await RowProduct.findById(
          product_details.rProduct_name
        );
        if (Rowproduct) {
          const { existingQty, qtyDifference } = calculateQtyDifference(
            existingItem.rProduct_name_Units,
            product_details.rProduct_name_Units,
            Rowproduct.stockUnit
          );

          if (qtyDifference !== 0) {
            await updateStock(
              product_details,
              "rProduct_name",
              "rProduct_name_Units",
              qtyDifference > 0 ? "Add" : "Lapse",
              Math.abs(qtyDifference)
            );
          }
        }
      }

      if (product_details.finalProductDetails?.length > 0) {
        for (const product of product_details.finalProductDetails) {
          const existingFinal = existingItem.finalProductDetails?.find(
            (p) => p.fProduct_name === product.fProduct_name
          );

          if (existingFinal) {
            const Rowproduct = await RowProduct.findById(product.fProduct_name);
            if (Rowproduct) {
              const { qtyDifference } = calculateQtyDifference(
                existingFinal.fProduct_name_Units,
                product.fProduct_name_Units,
                Rowproduct.stockUnit
              );

              if (qtyDifference !== 0) {
                await updateStock(
                  product,
                  "fProduct_name",
                  "fProduct_name_Units",
                  qtyDifference > 0 ? "Add" : "Lapse",
                  Math.abs(qtyDifference)
                );
              }
            }
          } else {
            const Rowproduct = await RowProduct.findById(product.fProduct_name);
            if (Rowproduct) {
              const totalQty = product.fProduct_name_Units.reduce(
                (sum, unit) =>
                  unit.unit === Rowproduct.stockUnit ? sum + unit.value : sum,
                0
              );
              await updateStock(
                product,
                "fProduct_name",
                "fProduct_name_Units",
                "Add",
                totalQty
              );
            }
          }
        }
      }

      if (product_details.wastageProductDetails?.length > 0) {
        for (const product of product_details.wastageProductDetails) {
          const existingWaste = existingItem.wastageProductDetails?.find(
            (p) => p.wProduct_name === product.wProduct_name
          );

          if (existingWaste) {
            const Rowproduct = await RowProduct.findById(product.wProduct_name);
            if (Rowproduct) {
              const { qtyDifference } = calculateQtyDifference(
                existingWaste.wProduct_name_Units,
                product.wProduct_name_Units,
                Rowproduct.stockUnit
              );

              if (qtyDifference !== 0) {
                await updateStock(
                  product,
                  "wProduct_name",
                  "wProduct_name_Units",
                  qtyDifference > 0 ? "Add" : "Lapse",
                  Math.abs(qtyDifference)
                );
              }
            }
          } else {
            const Rowproduct = await RowProduct.findById(product.wProduct_name);
            if (Rowproduct) {
              const totalQty = product.wProduct_name_Units
                .reduce(
                  (sum, unit) =>
                    unit.unit === Rowproduct.stockUnit ? sum + unit.value : sum,
                  0
                )
                .toFixed(2);
              await updateStock(
                product,
                "wProduct_name",
                "wProduct_name_Units",
                "Add",
                parseInt(totalQty)
              );
            }
          }
        }
      }
    };

    await processUpdates();
    Productfind.product_details[findIndex] = product_details;
    Productfind.processName = processName;
    Productfind.step_name = step_name;
    await Productfind.save();
    res
      .status(200)
      .json({ message: "Data Updated Successfully", status: true });
  } catch (error) {
    console.error("Error updating product details:", error);
    res.status(500).json({ message: "Internal Server Error", status: false });
  }
};

export const productionlapseWarehouse = async (qty, warehouseId, productId) => {
  try {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res
        .status(404)
        .json({ message: "warehouse not found", status: false });
    }
    const sourceProductItem = warehouse.productItems.find(
      (pItem) => pItem.productId.toString() === productId.toString()
    );
    if (sourceProductItem) {
      sourceProductItem.currentStock -= qty;
      sourceProductItem.transferQty -= qty;
      warehouse.markModified("productItems");
      await warehouse.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const productionAddWarehouse = async (qty, warehouseId, productId) => {
  try {
    const warehouse = await Warehouse.findById(warehouseId);
    if (!warehouse) {
      return res
        .status(404)
        .json({ message: "warehouse not found", status: false });
    }
    const sourceProductItem = warehouse.productItems.find(
      (pItem) => pItem.productId.toString() === productId.toString()
    );
    if (sourceProductItem) {
      sourceProductItem.currentStock += qty;
      sourceProductItem.transferQty += qty;
      warehouse.markModified("productItems");
      await warehouse.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export const productTarget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingProduct = await RowProduct.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: "Product not found", status: false });
    }
    const existingProductList = await StartProduction.find({});
    let totalStock = 0;
    existingProductList.forEach((item) => {
      item.product_details.forEach((product) => {
        product.finalProductDetails.forEach((data) => {
          if (data.fProduct_name === id) {
            const stocks = data.fProduct_name_Units.reduce((total, unit) => {
              if (unit.unit === existingProduct.stockUnit) {
                return total + unit.value;
              }
              return total;
            }, 0);
            totalStock += stocks;
          }
        });
      });
    });
    return res.status(200).json({
      message: "Current Target Found",
      status: true,
      id: existingProduct._id,
      product: existingProduct.Product_Title,
      totalStock,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
};

export const demoCodes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingProduct = await RowProduct.findById(id);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: "Product not found", status: false });
    }

    const result = await StartProduction.aggregate([
      {
        $unwind: "$product_details",
      },
      {
        $unwind: "$product_details.finalProductDetails",
      },
      {
        $match: {
          "product_details.finalProductDetails.fProduct_name": id,
        },
      },
      {
        $unwind: "$product_details.finalProductDetails.fProduct_name_Units",
      },
      {
        $match: {
          "product_details.finalProductDetails.fProduct_name_Units.unit":
            existingProduct.stockUnit,
        },
      },
      {
        $group: {
          _id: null,
          totalStock: {
            $sum: "$product_details.finalProductDetails.fProduct_name_Units.value",
          },
        },
      },
    ]);
    const totalStock = result.length > 0 ? result[0].totalStock : 0;
    return res.status(200).json({
      message: "Current Target Found",
      status: true,
      id: existingProduct._id,
      product: existingProduct.Product_Title,
      totalStock,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", status: false });
  }
};

export const wastageProductReport = async (req, res, next) => {
  try {
    const { database, financeYear } = req.params;

    const allData = await StartProduction.find({
      database,
      financeYear,
    }).populate({
      path: "product_details.wastageProductDetails.wProduct_name",
      model: "product",
    });

    if (allData.length === 0) {
      return res.status(404).json({
        message: "Data Not Found",
        status: false,
      });
    }

    const wastageProducts = [];

    allData.forEach((production) => {
      production.product_details?.forEach((product) => {
        product.wastageProductDetails?.forEach((wastage) => {
          wastageProducts.push({
            date: production.date,
            productName: wastage.wProduct_name?.productName,
            productSection: wastage.wProduct_name?.producttype,
            units: wastage.wProduct_name_Units,
          });
        });
      });
    });

    return res.status(200).json({
      status: true,
      message: "Wastage Product Report",
      data: wastageProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
      status: false,
    });
  }
};