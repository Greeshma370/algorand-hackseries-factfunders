
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useFunding } from "@/context/FundingContext";
import { Milestone, Proposal } from "@/types";

export default function CreateProposalPage() {
  const navigate = useNavigate();
  const { createProposal } = useFunding();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1488590528505-98d2b5aba04b");
  const [target, setTarget] = useState<number>(10000);
  const [endDate, setEndDate] = useState("");
  const [milestones, setMilestones] = useState<Omit<Milestone, "id" | "votes" | "completed" | "claimed">[]>([
    {
      title: "",
      description: "",
      amount: 0,
      dueDate: "",
    },
  ]);
  
  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: "",
        description: "",
        amount: 0,
        dueDate: "",
      },
    ]);
  };
  
  const updateMilestone = (index: number, field: string, value: string | number) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    setMilestones(updatedMilestones);
  };
  
  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      const updatedMilestones = [...milestones];
      updatedMilestones.splice(index, 1);
      setMilestones(updatedMilestones);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!title || !description || !category || !target || !endDate || milestones.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Check milestone amounts add up to target
    const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    if (totalMilestoneAmount !== target) {
      alert(`Total milestone amounts (${totalMilestoneAmount}) must equal the project target (${target})`);
      return;
    }
    
    // Check all milestones have titles and descriptions
    const incompleteMilestone = milestones.find(m => !m.title || !m.description || !m.amount || !m.dueDate);
    if (incompleteMilestone) {
      alert("Please complete all milestone details");
      return;
    }
    
    // Create proposal with milestones
    const newMilestones: Milestone[] = milestones.map((m, index) => ({
      ...m,
      id: `new-${index + 1}`,
      completed: false,
      votes: { yes: 0, no: 0 },
      claimed: false,
    }));
    
    const newProposal: Omit<Proposal, 'id' | 'createdAt' | 'backers' | 'raised'> = {
      title,
      description,
      creatorId: "current-user", // In a real app, this would be the actual user ID
      creatorName: "Your Name", // In a real app, this would be the actual user name
      category,
      target,
      endDate,
      status: "active",
      imageUrl,
      milestones: newMilestones,
    };
    
    createProposal(newProposal);
    navigate("/");
  };
  
  const categoryOptions = ["Technology", "Environment", "Health", "Education", "Community", "Arts"];
  
  return (
    <div className="container py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a New Project</h1>
        <p className="text-muted-foreground">
          Define your project details and milestones to start fundraising.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Project Title*
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  placeholder="Give your project a clear, descriptive title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Project Description*
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md min-h-28"
                  placeholder="Describe your project, its goals, and what you plan to deliver"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">
                    Category*
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                    Image URL*
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    placeholder="URL to your project's main image"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="target" className="block text-sm font-medium mb-1">
                    Funding Target ($)*
                  </label>
                  <input
                    id="target"
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    min="1"
                    placeholder="Total funding goal"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                    End Date*
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Project Milestones</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Break your project into milestones. The total of all milestone amounts should equal your funding target.
            Milestones help backers track progress and release funds as you complete each phase.
          </p>
          
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">Milestone {index + 1}</h3>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Milestone Title*
                      </label>
                      <input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        placeholder="E.g., Initial Prototype, Manufacturing, etc."
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description*
                      </label>
                      <textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        placeholder="What will you deliver in this milestone?"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Amount ($)*
                        </label>
                        <input
                          type="number"
                          value={milestone.amount}
                          onChange={(e) => updateMilestone(index, "amount", Number(e.target.value))}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Due Date*
                        </label>
                        <input
                          type="date"
                          value={milestone.dueDate}
                          onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="w-full"
            >
              Add Another Milestone
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Total milestone amount: ${milestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()} 
            (should equal target: ${target.toLocaleString()})
          </p>
        </div>
        
        <Separator />
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button type="submit">Create Project</Button>
        </div>
      </form>
    </div>
  );
}
