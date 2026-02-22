<?php
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/functions.php';

check_auth('ADMIN');

$pageTitle = "Admin Dashboard";

// Fetch Stats
$totalCommodities = $pdo->query("SELECT COUNT(*) FROM commodities")->fetchColumn();
$pendingCommodities = $pdo->query("SELECT COUNT(*) FROM commodities WHERE status = 'PENDING'")->fetchColumn();
$assignedCommodities = $pdo->query("SELECT COUNT(*) FROM commodities WHERE status = 'ASSIGNED'")->fetchColumn();
$unidentifiedMessages = $pdo->query("SELECT COUNT(*) FROM commodities WHERE status = 'UNIDENTIFIED'")->fetchColumn();

// Fetch Commodities
$commodities = $pdo->query("SELECT * FROM commodities ORDER BY created_at DESC")->fetchAll();

// Fetch Users for Assignment
$users = $pdo->prepare("SELECT id, name FROM users WHERE role = 'USER'");
$users->execute();
$sourcingTeam = $users->fetchAll();

include 'templates/header.php';
?>

<div class="space-y-8">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p class="text-slate-500 mt-1">Monitor message parsing and assign sourcing tasks</p>
        </div>
        <button onclick="toggleSimulator()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            WhatsApp Simulator
        </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div class="text-slate-500 text-sm font-medium mb-1">Total Signals</div>
            <div class="text-2xl font-bold"><?php echo $totalCommodities; ?></div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div class="text-amber-500 text-sm font-medium mb-1">Pending</div>
            <div class="text-2xl font-bold font-mono"><?php echo $pendingCommodities; ?></div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div class="text-blue-500 text-sm font-medium mb-1">Assigned</div>
            <div class="text-2xl font-bold"><?php echo $assignedCommodities; ?></div>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div class="text-red-500 text-sm font-medium mb-1">Unidentified</div>
            <div class="text-2xl font-bold"><?php echo $unidentifiedMessages; ?></div>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 gap-8">
        <!-- Commodity Table -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50">
                <h3 class="font-semibold text-slate-800">Recent Sourcing Signals</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th class="px-6 py-4">Commodity</th>
                            <th class="px-6 py-4">Location</th>
                            <th class="px-6 py-4">Qty / Rate</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php foreach ($commodities as $c): ?>
                        <tr class="hover:bg-slate-50/50 transition-colors">
                            <td class="px-6 py-4 font-medium text-slate-900">
                                <?php echo htmlspecialchars($c['parsed_name'] ?? 'Unknown'); ?>
                            </td>
                            <td class="px-6 py-4 text-slate-600">
                                <?php echo htmlspecialchars($c['location'] ?? 'N/A'); ?>
                            </td>
                            <td class="px-6 py-4 text-slate-600">
                                <?php echo $c['quantity'] ?? '?'; ?> <?php echo $c['unit']; ?> @ <?php echo $c['rate'] ? 'Rs.'.$c['rate'] : '?'; ?>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 rounded-full text-xs font-medium 
                                    <?php 
                                        echo $c['status'] === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                                            ($c['status'] === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' : 
                                            ($c['status'] === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700')); 
                                    ?>">
                                    <?php echo $c['status']; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <?php if ($c['status'] === 'PENDING'): ?>
                                <button onclick="openAssignModal('<?php echo $c['id']; ?>', '<?php echo addslashes($c['parsed_name']); ?>')" class="text-blue-600 hover:text-blue-700 font-medium text-sm">Assign</button>
                                <?php else: ?>
                                <button class="text-slate-400 font-medium text-sm" disabled>View</button>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php if (empty($commodities)): ?>
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-slate-500">No signals found. Use the simulator to send signals.</td>
                        </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- Simulator Modal -->
<div id="simulatorModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 relative">
        <button onclick="toggleSimulator()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">&times;</button>
        <h3 class="text-2xl font-bold mb-4">WhatsApp Simulator</h3>
        <textarea id="simMessage" rows="3" placeholder="Ex: Need 50 tons Wheat in Mumbai @ 2500" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mb-4"></textarea>
        <button onclick="sendSimulatedMessage()" class="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg">Send Message</button>
    </div>
</div>

<!-- Assign Modal -->
<div id="assignModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <h3 class="text-xl font-bold mb-4">Assign Task: <span id="assignTitle" class="text-indigo-600"></span></h3>
        <form id="assignForm">
            <input type="hidden" id="assignId" name="commodity_id">
            <label class="block text-sm font-medium mb-1">Select User</label>
            <select name="user_id" class="w-full px-4 py-2 rounded-lg border border-slate-200 mb-6 focus:ring-2 focus:ring-blue-500 outline-none">
                <?php foreach ($sourcingTeam as $user): ?>
                <option value="<?php echo $user['id']; ?>"><?php echo htmlspecialchars($user['name']); ?></option>
                <?php endforeach; ?>
            </select>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Confirm Assignment</button>
        </form>
    </div>
</div>

<script>
function toggleSimulator() {
    document.getElementById('simulatorModal').classList.toggle('hidden');
}

function openAssignModal(id, title) {
    document.getElementById('assignId').value = id;
    document.getElementById('assignTitle').innerText = title;
    document.getElementById('assignModal').classList.remove('hidden');
}

async function sendSimulatedMessage() {
    const message = document.getElementById('simMessage').value;
    if (!message) return;
    
    const formData = new FormData();
    formData.append('message', message);
    
    const response = await fetch('api/simulate.php', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    if (result.success) {
        location.reload();
    } else {
        alert(result.error);
    }
}

document.getElementById('assignForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('api/assign.php', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (result.success) {
        location.reload();
    } else {
        alert(result.error);
    }
}
</script>

<?php include 'templates/footer.php'; ?>
