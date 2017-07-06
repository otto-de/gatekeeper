const gateRepository = require('../../repositories/gateRepository');
const ticketRepository = require('../../repositories/ticketRepository');
const db = require('../../repositories/database');


describe('ticketRepository', () => {

    beforeEach(async () => {
        const gatekeeperCollection = db.get('gatekeeper');
        await gatekeeperCollection.drop();
    });

    afterAll(() => {
        db.close();
    });

    it('should create a ticket', async () => {
        //given
        await gateRepository.createOrUpdateService('myGroup', 'myService', ['env1', 'env2', 'env3']);

        //when
        await ticketRepository.addTicket('myGroup', 'myService', 'env1', 'ticket1');
        await ticketRepository.addTicket('myGroup', 'myService', 'env1', 'ticket2');
        //then
        const gate = await gateRepository.findGate('myGroup', 'myService', 'env1');
        expect(gate.queue).toEqual(['ticket1', 'ticket2']);
    });

    it('should delete a ticket', async () => {
        //given
        await gateRepository.createOrUpdateService('myGroup', 'myService', ['env1', 'env2', 'env3']);
        await ticketRepository.addTicket('myGroup', 'myService', 'env1', 'ticket1');
        await ticketRepository.addTicket('myGroup', 'myService', 'env1', 'ticket2');

        //when
        await ticketRepository.deleteTicket('myGroup', 'myService', 'env1', 'ticket2');
        //then
        const gate = await gateRepository.findGate('myGroup', 'myService', 'env1');
        expect(gate.queue).toEqual(['ticket1']);
    });

});