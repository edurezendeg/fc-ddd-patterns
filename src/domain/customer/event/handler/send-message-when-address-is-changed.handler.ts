import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import EventInterface from "../../../@shared/event/event.interface";

export default class SendMessageWhenAddressIsChanged implements EventHandlerInterface{
    handle(event: EventInterface): void {
        const costumerId = event.eventData.id
        const costumerName = event.eventData.name
        const newCostumerAddress = event.eventData.Address

        console.log(`Endereço do cliente: ${costumerId}, ${costumerName} alterado para: ${newCostumerAddress.toString()}`); 

    }

}