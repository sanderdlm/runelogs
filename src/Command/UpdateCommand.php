<?php


namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use App\Utils\UpdateService;

class UpdateCommand extends Command
{
    private $updateService;

    protected static $defaultName = 'app:update';

    public function __construct(UpdateService $updateService)
    {
        $this->updateService = $updateService;

        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
		$this->updateService->update();
    }
}