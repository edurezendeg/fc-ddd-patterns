import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface{
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),        
      },
      {
        where: {
          id: entity.id
        },        
      }
    );


    const existingOrderItems = await OrderItemModel.findAll({
      where: { order_id: entity.id }
    });  
    const existingItemIds = new Set(existingOrderItems.map(item => item.id));
    
    // Atualizar e criar
    for (const item of entity.items) {
      if (item.id && existingItemIds.has(item.id)) {
        // Atualizar item existente
        await OrderItemModel.update({
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        }, {
          where: { id: item.id, order_id: entity.id }
        });
      } else {
        // Criar novo item
        await OrderItemModel.create({
          order_id: entity.id,
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        });
      } 
    }



  }

  async find(id: string): Promise<Order> {
      const orderModel  = await OrderModel.findOne({where:{ id },include: ["items"]});

      let items = orderModel.items.map((item) =>{
        return new OrderItem(item.id,item.name,item.price,item.product_id,item.quantity);
      });

      return new Order(orderModel.id, orderModel.customer_id,items );
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll( {
        include: [{ model: OrderItemModel }],
      });
    return orderModels.map((orderModel) =>{
      if(orderModel.items){
        let items = orderModel.items.map((item) =>{
          return new OrderItem(item.id,item.name,item.price,item.product_id,item.quantity);
        });
        return new Order(orderModel.id,orderModel.customer_id,items);
      }else{
        return new Order(orderModel.id,orderModel.customer_id,null);
      }

    });

  }

}
